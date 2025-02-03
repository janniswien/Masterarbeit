import {writeFile} from "~/services/server/files/writeFile";

export default defineEventHandler(async (event) =>({
  body: writeFile(`./trace-files/${getRouterParam(event, "sessionId")}.txt`, await readBody(event))
}))
