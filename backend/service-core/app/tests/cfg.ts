import request from "supertest"
// import app from "../src/app"

export const reqApp = request('localhost:4000')
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
export const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzOTZjNDA5ZTNhNWFkOTMwYTM4YWNkNiIsImlhdCI6MTY3NTY2NDMxNn0.PymeRN1dOltEYWaFem63pErecOexbqGg2ggVrxs9Y94'