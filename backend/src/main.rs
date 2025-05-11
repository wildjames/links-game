mod game_encoder;


use game_encoder::{GameState, encode, validate};

// External crates
use axum::{
    extract::{Json, Path},
    http::StatusCode,
    routing::{get, post},
    Extension,
    Router
};
use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use std::env;
use tower_http::services::ServeDir;
use uuid::Uuid;
use sqlx::Row;

#[derive(Serialize, Deserialize)]
struct FetchIDData {
    game_encoding: String
}

#[derive(Serialize)]
struct Created {
    id: Uuid,
}

async fn create(
    Extension(db): Extension<sqlx::MySqlPool>,
    Json(state): Json<GameState>,
) -> Result<Json<Created>, (StatusCode, String)> {
    // validate the GameState
    if let Err(err_msg) = validate(&state) {
        // 400 Bad Request with a descriptive message
        return Err((StatusCode::BAD_REQUEST, err_msg));
    }

    // encode the GameState to base64
    let encoded = encode(&state)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // insert into DB
    let id = Uuid::new_v4();
    sqlx::query("INSERT INTO items (id, game_encoding) VALUES (?, ?)")
        .bind(id.to_string())
        .bind(&encoded)
        .execute(&db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(Created { id }))
}

async fn fetch(
    Extension(db): Extension<sqlx::MySqlPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<FetchIDData>, StatusCode> {
    // run the query, propagating any DB errors as a 500
    let row_opt = sqlx::query("SELECT game_encoding FROM items WHERE id = ?")
        .bind(id.to_string())
        .fetch_optional(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // if we got a row, return it; otherwise return 404
    if let Some(row) = row_opt {
        let game_encoding: String = row.get("game_encoding");
        Ok(Json(FetchIDData { game_encoding }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
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

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&db_pool)
        .await
        .expect("Failed to run migrations");

    // routes
    let api = Router::new()
        .route("/create", post(create))
        .route("/fetch/{id}", get(fetch))
        .layer(Extension(db_pool.clone()));

    let app = Router::new()
        .nest("/api", api)
        // Serve static files for the frontend
        .nest_service("/index", ServeDir::new("../dist"));

    // Run the server with tokio, listening on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    // Run
    tracing_subscriber::fmt::init(); // optional, for logging
    axum::serve(listener, app).await.unwrap()
}
