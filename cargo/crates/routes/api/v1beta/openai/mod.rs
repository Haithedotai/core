use actix_web::web;

pub mod chat;
pub mod models;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/chat")
            .configure(chat::routes)
        )
            .service(web::scope("/models").configure(models::routes));
}
