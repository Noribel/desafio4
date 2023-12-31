import express from "express"
import prodRouter from "./router/product.routes.js"
import cartRouter from "./router/cart.routes.js"
import { engine } from "express-handlebars"
import * as path from "path"
import __dirname from "./utils.js"
import ProductManager from "./controllers/ProductManager.js"
import {Server} from "socket.io"

const app = express()

const PORT = 8080

const product = new ProductManager()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor Express Puerto ${PORT}`)
})

const socketServer = new Server(httpServer)


socketServer.on("connection", socket => {
    console.log("Nuevo Cliente Conectado")
    socket.on("message", data => {
        console.log(data)
    })

    socket.on("newProd", (newProduct) => {
        product.addProducts(newProduct)
        socketServer.emit("success", "Producto Agregado Correctamente");
    });

    socket.emit("test","mensaje desde servidor a cliente, se valida en consola de navegador")
})

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname + "/views"))

app.use("/", express.static(__dirname + "/public"))

app.use("/realtimeproducts", prodRouter)

app.get("/", async (req, res) => {
    let allProducts  = await product.getProducts()
    res.render("home", {
        title: "Handlebars",
        products : allProducts
    })
})