use actix_web::web;

pub mod auth;
pub mod me;
pub mod orgs;
pub mod tee;
pub mod projects;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/auth").configure(auth::routes))
        .service(web::scope("/me").configure(me::routes))
        .service(web::scope("/orgs").configure(orgs::routes))
        .service(web::scope("/tee").configure(tee::routes))
        .service(web::scope("/projects").configure(projects::routes));
}
