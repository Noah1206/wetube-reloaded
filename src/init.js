import "dotenv/config.js";
import "./db.js"; 
import "./models/Video.js";
import "./models/User.js";
import app from "./server.js"

const handleListening = () => 
    console.log(`Server listening on port http://localhost:${PORT}`);

app.listen(4000, handleListening);

const PORT = 4000;