import * as auth from "./auth.js";

const requiresLogin = document.body.dataset.requiresLogin !== undefined;

export default function pageGuard() {
    if (requiresLogin && !auth.getCurrentUser())
        document.location.href = "login.html";
}