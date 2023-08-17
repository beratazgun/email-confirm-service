import { app } from './app'

const port: number = Number(process.env.PORT)

app.listen(port, (): void => console.log(`Listening on port ${port}! 🎧🎧🎧`))
