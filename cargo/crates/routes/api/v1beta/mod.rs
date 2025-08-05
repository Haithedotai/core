use actix_web::web;

pub mod chat;
pub mod openai;
pub mod webhook;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/openai").configure(openai::routes));
    cfg.service(web::scope("/chat").configure(chat::routes));
    cfg.service(web::scope("/webhook").configure(webhook::routes));
}
