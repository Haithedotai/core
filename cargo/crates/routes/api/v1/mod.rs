use actix_web::web;

pub mod analytics;
pub mod auth;
pub mod creator;
pub mod me;
pub mod models;
pub mod orgs;
pub mod products;
pub mod projects;
pub mod stats;
pub mod tee;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/analytics").configure(analytics::routes))
        .service(web::scope("/auth").configure(auth::routes))
        .service(web::scope("/me").configure(me::routes))
        .service(web::scope("/models").configure(models::routes))
        .service(web::scope("/orgs").configure(orgs::routes))
        .service(web::scope("/projects").configure(projects::routes))
        .service(web::scope("/creator").configure(creator::routes))
        .service(web::scope("/products").configure(products::routes))
        .service(web::scope("/stats").configure(stats::routes))
        .service(web::scope("/tee").configure(tee::routes));
}
