const supabase = require("../config/supabase");

const signup = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required",
        });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ user: data.user });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required",
        });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(401).json({ error: "Invalid login credentials" });
    }

    res.status(200).json({
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
    });
};

const logout = async (req, res) => {
    // Token already verified by requireAuth middleware
    await supabase.auth.signOut();
    res.status(204).send();
};

module.exports = { signup, login, logout };
