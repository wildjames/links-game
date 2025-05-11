use axum::{
    Extension,
    extract::{Json, Path},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use std::env;
use tower_http::services::ServeDir;
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
struct MyData {
    foo: String,
    bar: i32,
}

#[derive(Serialize)]
struct Created {
    id: Uuid,
}

async fn create(
    Extension(_db): Extension<sqlx::MySqlPool>,
    Json(_payload): Json<MyData>,
) -> Json<Created> {
    // Doesn't do anything just yet.
    let id = Uuid::new_v4();
    Json(Created { id })
}

async fn fetch(
    Extension(_db): Extension<sqlx::MySqlPool>,
    Path(_id): Path<Uuid>,
) -> Json<MyData> {
    // Return some static dummy data for now
    Json(MyData {
        foo: "bar".into(),
        bar: 42,
    })
}

#[tokio::main]
async fn main() {
    // Load from `.env` (if present).
    dotenv::dotenv().ok();

    let db_user =
        env::var("DB_USERNAME").expect("DB_USERNAME must be set");
    let db_pass =
        env::var("DB_PASSWORD").expect("DB_PASSWORD must be set");
    let db_host =
        env::var("DB_HOST").unwrap_or_else(|_| "localhost".into());
    let db_port =
        env::var("DB_PORT").unwrap_or_else(|_| "3306".into());
    let db_name =
        env::var("DB_NAME").expect("DB_NAME must be set");

    // Build the database connection URL
    //    mysql://user:pass@host:port/database
    let database_url = format!(
        "mysql://{}:{}@{}:{}/{}",
        db_user, db_pass, db_host, db_port, db_name
    );

    // Create a connection pool
    let db_pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to MySQL");

    // routes
    let api = Router::new()
        .route("/create", post(create))
        .route("/fetch/{id}", get(fetch))
        .layer(Extension(db_pool.clone()));

    let app = Router::new()
        .nest("/api", api)
        // Serve static files for the frontend
        .nest_service("/index", ServeDir::new("../dist"));

    // Run the server with hyper, listening on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    // Run
    tracing_subscriber::fmt::init(); // optional, for logging
    axum::serve(listener, app).await.unwrap()
}
