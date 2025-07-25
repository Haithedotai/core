use actix_web::web;

pub mod auth;
pub mod me;
pub mod models;
pub mod orgs;
pub mod projects;
pub mod tee;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/auth").configure(auth::routes))
        .service(web::scope("/me").configure(me::routes))
        .service(web::scope("/models").configure(models::routes))
        .service(web::scope("/orgs").configure(orgs::routes))
        .service(web::scope("/projects").configure(projects::routes))
        .service(web::scope("/tee").configure(tee::routes));
}
