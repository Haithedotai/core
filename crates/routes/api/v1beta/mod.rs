use actix_web::web;
pub mod openai;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/openai").configure(openai::routes));
}
