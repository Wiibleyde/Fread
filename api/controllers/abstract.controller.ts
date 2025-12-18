class AbstractController {
    constructor() {
        if (new.target === AbstractController) {
            throw new TypeError("Cannot construct AbstractController instances directly");
        }
    }

    
}