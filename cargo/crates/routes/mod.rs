use actix_web::web;

pub mod api;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/api").configure(api::routes));
}
