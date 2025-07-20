use actix_web::{HttpResponse, Responder, http::StatusCode};
use serde::Serialize;
use serde_json::json;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T>
where
    T: Serialize,
{
    success: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
}

pub fn ok<T: Serialize + 'static>(message: &str, data: impl Into<Option<T>>) -> impl Responder {
    let data = data.into();

    let should_treat_as_none = std::any::TypeId::of::<T>() == std::any::TypeId::of::<()>();

    match data {
        Some(d) if !should_treat_as_none => HttpResponse::Ok().json(ApiResponse {
            success: true,
            message: message.to_string(),
            data: Some(d),
        }),
        _ => HttpResponse::Ok().json(json!({
            "success": true,
            "message": message,
            "data": {}
        })),
    }
}

pub fn err(message: &str, status: u16) -> HttpResponse {
    HttpResponse::build(StatusCode::from_u16(status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR))
        .json(ApiResponse::<()> {
            success: false,
            message: message.to_string(),
            data: None,
        })
}
