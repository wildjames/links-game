use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct WordCategory {
    #[serde(rename = "wordArray")]
    pub word_array: Vec<String>,

    #[serde(rename = "categoryName")]
    pub category_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GameState {
    pub categories: Vec<WordCategory>,
    pub rows: usize,
    #[serde(rename = "categorySize")]
    pub category_size: usize,
}

/// JSON-serialize the `GameState` and then Base64-encode the result.
pub fn encode(state: &GameState) -> Result<String, serde_json::Error> {
    let json = serde_json::to_string(state)?;
    Ok(general_purpose::STANDARD.encode(json))
}


/// Does some basic validation of the `GameState` struct.
/// - Each string must be more than 0 and less than 20 characters.
/// - The number of rows must be at least 2 and at most 10.
/// - The category size must be at least 2 and at most 10.
/// - The number of categories must match the number of rows.
/// - Each category must have the same number of words as the category size.
pub fn validate(state: &GameState) -> Result<(), String> {
    for category in &state.categories {
        if category.category_name.len() > 20 || category.category_name.is_empty() {
            return Err(format!(
                "Category name `{}` not a good length ({} chars, max 20 min 1)",
                category.category_name,
                category.category_name.len()
            ));
        }
        for word in &category.word_array{
            if word.len() > 20 || word.is_empty() {
                return Err(format!(
                    "Word `{}` in category `{}` not a good length ({} chars, max 20 min 1)",
                    word,
                    category.category_name,
                    word.len()
                ));
            }
        }
    }

    // Check that the number of rows is at least 2 and at most 10
    if state.rows < 2 || state.rows > 10 {
        return Err(format!(
            "Number of rows `{}` is out of range (2-10)",
            state.rows
        ));
    }

    // Check that the category size is at least 2 and at most 10
    if state.category_size < 2 || state.category_size > 10 {
        return Err(format!(
            "Category size `{}` is out of range (2-10)",
            state.category_size
        ));
    }

    // Check that the number of categories matches the number of rows
    // and that each category has the same number of words
    if state.categories.len() != state.rows {
        return Err(format!(
            "Number of categories `{}` does not match number of rows `{}`",
            state.categories.len(),
            state.rows
        ));
    }
    for category in &state.categories {
        if category.word_array.len() != state.category_size {
            return Err(format!(
                "Category `{}` has {} words, expected {}",
                category.category_name,
                category.word_array.len(),
                state.category_size
            ));
        }
    }

    Ok(())
}
