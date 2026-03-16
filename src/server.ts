import app from "./app";
import { envConfig } from "./config/env";


const boostrap = () => {
    try {
        app.listen(envConfig.PORT, () => {
            console.log(`Server is running on http://localhost:${envConfig.PORT}`);
        });

    } catch (error) {
        console.log("Failed  to start server : ", error);
    }
}
boostrap();