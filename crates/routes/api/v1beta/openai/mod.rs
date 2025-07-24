use actix_web::web;
pub mod chat;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/chat").configure(chat::routes));
}
