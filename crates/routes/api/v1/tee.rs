use actix_web::{App, HttpResponse, HttpServer, Responder, get, web};
use alith::tee::marlin::{AttestationRequest, MarlinClient};
use serde::Serialize;

#[derive(Serialize)]
struct TeeInfo {
    tee_pubkey: String,
    attestation: String,
}

#[get("/attest")]
async fn get_attest_handler() -> impl Responder {
    let client = MarlinClient::default();

    let attestation_hex = match client
        .attestation_hex(AttestationRequest {
            user_data: Some("test".as_bytes().to_vec()),
            ..Default::default()
        })
        .await
    {
        Ok(att_hex) => att_hex,
        Err(err) => {
            return HttpResponse::InternalServerError()
                .body(format!("Failed to get attestation: {}", err));
        }
    };

    HttpResponse::Ok().json(TeeInfo {
        tee_pubkey: String::from("unknown (not derivable without decoding)"),
        attestation: attestation_hex,
    })
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_attest_handler);
}
