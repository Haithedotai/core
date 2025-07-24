use alith::LLM;

pub fn resolve_model(name: &str) -> LLM {
    let mut base_url: &str = "";
    let mut api_key: String = String::new();
    let mut model_name: &str = "";

    let gemini_models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ];
    if gemini_models.contains(&name) {
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai";
        api_key = std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY not set");

        model_name = name;
    }

    let openai_models = [
        "gpt-o3",
        "gpt-o3-mini",
        "gpt-o4-mini",
        "gpt-4.1-nano",
        "gpt-4.1-mini",
    ];
    if openai_models.contains(&name) {
        base_url = "https://api.openai.com/v1";
        api_key = std::env::var("OPENAI_API_KEY").expect("OPENAI_API_KEY not set");

        model_name = name;
    }

    let deepseek_models = ["deepseek-chat", "deepseek-reasoner"];
    if deepseek_models.contains(&name) {
        base_url = "https://api.deepseek.com/v1";
        api_key = std::env::var("DEEPSEEK_API_KEY").expect("DEEPSEEK_API_KEY not set");

        model_name = name;
    }

    let moonshot_models = ["kimi-k2"];
    if moonshot_models.contains(&name) {
        base_url = "https://api.moonshot.com/v1";
        api_key = std::env::var("MOONSHOT_API_KEY").expect("MOONSHOT_API_KEY not set");

        model_name = name;
        if name == "kimi-k2" {
            model_name = "kimi-k2-0711-preview";
        }
    }

    if base_url == "" || api_key.is_empty() || model_name == "" {
        panic!("Model {} not found or not supported", name);
    }

    LLM::openai_compatible_model(base_url, &api_key, model_name).unwrap_or_else(|_| {
        panic!("Model {} not found or not supported", name);
    })
}
