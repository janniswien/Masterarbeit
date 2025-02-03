import {readFile} from "~/services/server/files/readFile";

export default defineEventHandler(async (event) => ({
  content: await readFile(`./trace-files/${getRouterParam(event, "sessionId")}.txt`)
}))
