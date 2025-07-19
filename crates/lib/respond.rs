use actix_web::{HttpResponse, Responder, http::StatusCode};
use serde::Serialize;

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

pub fn ok<T: Serialize>(message: &str, data: T) -> impl Responder {
    HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: message.to_string(),
        data: Some(data),
    })
}

pub fn err(message: &str, status: u16) -> HttpResponse {
    HttpResponse::build(StatusCode::from_u16(status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR))
        .json(ApiResponse::<()> {
            success: false,
            message: message.to_string(),
            data: None,
        })
}
