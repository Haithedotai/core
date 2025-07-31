use alith::LLM;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: u64,
    pub name: String,
    pub display_name: String,
    pub provider: String,
    pub is_active: bool,
    pub price_per_call: u64,
}

pub fn get_models() -> Vec<Model> {
    let models = vec![
        Model {
            id: 1,
            name: "gemini-2.0-flash".to_string(),
            display_name: "Gemini 2.0 Flash".to_string(),
            provider: "Google".to_string(),
            is_active: true,
            price_per_call: 0,
        },
        Model {
            id: 2,
            name: "gemini-2.0-flash-lite".to_string(),
            display_name: "Gemini 2.0 Flash Lite".to_string(),
            provider: "Google".to_string(),
            is_active: true,
            price_per_call: 0,
        },
        Model {
            id: 3,
            name: "gemini-2.5-pro".to_string(),
            display_name: "Gemini 2.5 Pro".to_string(),
            provider: "Google".to_string(),
            is_active: true,
            price_per_call: 0.0015,
        },
        Model {
            id: 4,
            name: "gemini-2.5-flash".to_string(),
            display_name: "Gemini 2.5 Flash".to_string(),
            provider: "Google".to_string(),
            is_active: true,
            price_per_call: 0.001,
        },
        Model {
            id: 5,
            name: "gemini-2.5-flash-lite".to_string(),
            display_name: "Gemini 2.5 Flash Lite".to_string(),
            provider: "Google".to_string(),
            is_active: true,
            price_per_call: 0.0008,
        },
        Model {
            id: 6,
            name: "gpt-o3".to_string(),
            display_name: "GPT-0.3".to_string(),
            provider: "OpenAI".to_string(),
            is_active: false,

            price_per_call: 0,
        },
        Model {
            id: 7,
            name: "gpt-o3-mini".to_string(),
            display_name: "GPT-0.3 Mini".to_string(),
            provider: "OpenAI".to_string(),
            is_active: false,
            price_per_call: 0,
        },
        Model {
            id: 8,
            name: "gpt-o4-mini".to_string(),
            display_name: "GPT-0.4 Mini".to_string(),
            provider: "OpenAI".to_string(),
            is_active: false,
            price_per_call: 0,
        },
        Model {
            id: 9,
            name: "gpt-4.1-nano".to_string(),
            display_name: "GPT-4.1 Nano".to_string(),
            provider: "OpenAI".to_string(),
            is_active: false,
            price_per_call: 0,
        },
        Model {
            id: 10,
            name: "gpt-4.1-mini".to_string(),
            display_name: "GPT-4.1 Mini".to_string(),
            provider: "OpenAI".to_string(),
            is_active: false,
            price_per_call: 0,
        },
        Model {
            id: 11,
            name: "deepseek-chat".to_string(),
            display_name: "DeepSeek Chat".to_string(),
            provider: "DeepSeek".to_string(),
            is_active: false,
            price_per_call: 0,
        },
        Model {
            id: 12,
            name: "deepseek-reasoner".to_string(),
            display_name: "DeepSeek Reasoner".to_string(),
            provider: "DeepSeek".to_string(),
            is_active: false,
            price_per_call: 0,
        },
        Model {
            id: 13,
            name: "kimi-k2-0711-preview".to_string(),
            display_name: "Kimi K2".to_string(),
            provider: "Haithe".to_string(),
            is_active: true,
            price_per_call: 0,
        },
    ];

    models
}

pub fn resolve_model(name: &str) -> LLM {
    let model = get_models()
        .into_iter()
        .find(|m| m.name == name && m.is_active)
        .unwrap_or_else(|| panic!("Model {} not found or not supported", name));

    let (base_url, env_var) = match model.provider.as_str() {
        "OpenAI" => ("https://api.openai.com/v1", "OPENAI_API_KEY"),
        "Google" => (
            "https://generativelanguage.googleapis.com/v1beta/openai",
            "GEMINI_API_KEY",
        ),
        "DeepSeek" => ("https://api.deepseek.com/v1", "DEEPSEEK_API_KEY"),
        "Moonshot" => ("https://api.moonshot.com/v1", "MOONSHOT_API_KEY"),
        _ => panic!("Unsupported provider: {}", model.provider),
    };

    let api_key = std::env::var(env_var).unwrap_or_else(|_| panic!("{} not set", env_var));

    LLM::openai_compatible_model(&api_key, base_url, &model.name).unwrap_or_else(|_| {
        panic!("Failed to initialize model {}", name);
    })
}
