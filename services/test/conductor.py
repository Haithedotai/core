import subprocess
import os
import shutil
import sys
import time
import signal
import urllib.request
import urllib.error

TEST_ENV = {
    "DATABASE_URL" : "sqlite://data/debug.db",
    "PORT": "54125",
    }

TEST_FILES = [
    "services/test/api.test.ts",
    "services/test/auth.test.ts",
    "services/test/orgs.test.ts",
    "services/test/projects.test.ts",
]

def find_cargo():
    cargo_path = shutil.which("cargo")
    if cargo_path:
        return cargo_path
    
    home = os.path.expanduser("~")
    common_paths = [
        os.path.join(home, ".cargo", "bin", "cargo"),
        "/usr/local/cargo/bin/cargo",
        "/usr/bin/cargo",
    ]    
    for path in common_paths:
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path

    return None

def find_bun():
    bun_path = shutil.which("bun")
    if bun_path:
        return bun_path
    
    home = os.path.expanduser("~")
    common_paths = [
        os.path.join(home, ".bun", "bin", "bun"),
        "/usr/local/bin/bun",
        "/usr/bin/bun",
    ]    
    for path in common_paths:
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path

    return None

def wait_for_server(port, timeout=30):
    """Wait for server to be ready by checking if it responds to requests."""
    server_url = f"http://localhost:{port}/health"
    print(f"Waiting for server at {server_url} to be ready...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            # Try to make a simple GET request to check if server is responding
            response = urllib.request.urlopen(server_url, timeout=2)
            if response.getcode() in [200, 404]:  # 404 is also fine, means server is responding
                print("Server is ready!")
                time.sleep(1)
                return True
        except (urllib.error.URLError, urllib.error.HTTPError, OSError):
            # Server not ready yet, wait a bit
            time.sleep(0.5)
            continue
    
    print(f"Timeout: Server did not respond within {timeout} seconds")
    return False

def run_test_file(bun_cmd, test_file, env):
    """Run a single test file and return success status."""
    print(f"\n{'='*50}")
    print(f"Running: {test_file}")
    print(f"{'='*50}")
    
    if not os.path.exists(test_file):
        print(f"Warning: Test file {test_file} not found, skipping...")
        return True
    
    try:
        test_process = subprocess.run(
            [bun_cmd, "test", test_file],
            env=env,
            timeout=120  # 2 minute timeout per test file
        )
        
        success = test_process.returncode == 0
        if success:
            print(f"✅ {test_file} PASSED")
        else:
            print(f"❌ {test_file} FAILED (exit code: {test_process.returncode})")
        
        return success
        
    except subprocess.TimeoutExpired:
        print(f"⏰ {test_file} TIMED OUT")
        return False
    except Exception as e:
        print(f"💥 {test_file} ERROR: {e}")
        return False

def main():
    cargo_cmd = find_cargo()
    if not cargo_cmd:
        print("Error: cargo not found. Rust install karlo bhaiya!")
        sys.exit(1)
    
    bun_cmd = find_bun()
    if not bun_cmd:
        print("Error: bun not found. Please install bun!")
        sys.exit(1)
    
    print(f"Using cargo : {cargo_cmd}")
    print(f"Using bun : {bun_cmd}")
    
    env = os.environ.copy()
    env.update(TEST_ENV)
    env["RUST_LOG"] = "debug"  

    os.makedirs("data", exist_ok=True)
    os.makedirs("services/test/logs", exist_ok=True)
    
    db_path = TEST_ENV["DATABASE_URL"].replace("sqlite://", "").replace("/", os.sep)
    if not os.path.exists(db_path):
        with open(db_path, "w") as f:
            f.write("")

    server_process = None
    total_tests = len(TEST_FILES)
    passed_tests = 0
    failed_tests = []
    
    try:
        with open("services/test/logs/conductor.server.log", "w") as log_file:
            print("Starting server...")
            server_process = subprocess.Popen(
                [cargo_cmd, "run"],
                env=env,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                close_fds=True
            )
            
            print(f"Server http://localhost:{TEST_ENV['PORT']} with PID: {server_process.pid}")
            
            # Wait for server to be ready
            if not wait_for_server(TEST_ENV['PORT']):
                print("Server failed to start properly")
                return
            
            print(f"\n🚀 Running {total_tests} test files...")
            
            # Run each test file
            for test_file in TEST_FILES:
                if run_test_file(bun_cmd, test_file, env):
                    passed_tests += 1
                else:
                    failed_tests.append(test_file)
                
                # Small delay between test files to avoid conflicts
                time.sleep(1)
            
            # Summary
            print(f"\n{'='*60}")
            print(f"TEST SUMMARY")
            print(f"{'='*60}")
            print(f"Total test files: {total_tests}")
            print(f"Passed: {passed_tests}")
            print(f"Failed: {len(failed_tests)}")
            
            if failed_tests:
                print(f"\nFailed test files:")
                for failed_test in failed_tests:
                    print(f"  ❌ {failed_test}")
                print(f"\n🔴 OVERALL: FAILED")
                exit_code = 1
            else:
                print(f"\n🟢 OVERALL: ALL TESTS PASSED!")
                exit_code = 0
                
            sys.exit(exit_code)
            
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"💥 Error: {e}")
        sys.exit(1)
    finally:
        if server_process and server_process.poll() is None:
            print("Stopping server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
                server_process.wait()

if __name__ == "__main__":
    main()