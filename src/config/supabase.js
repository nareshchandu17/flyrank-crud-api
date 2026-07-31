require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
    throw new Error(
        "Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file."
    );
}

const supabase = createClient(url, key);

module.exports = supabase;
