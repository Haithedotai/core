use actix_web::web;

pub mod v1;
pub mod v1beta;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/v1").configure(v1::routes));
    cfg.service(web::scope("/v1beta").configure(v1beta::routes));
}
