import {writeFile} from "~/services/server/files/writeFile";
import {readFile} from "~/services/server/files/readFile";

export default defineEventHandler(async (event) => {
  const path = `./trace-files/${getRouterParam(event, "sessionId")}.txt`

  return {
    body: writeFile(path, `${await readFile(path)} \r\n ${await readBody(event)}`),
    sessionId: getRouterParam(event, "sessionId")
  }
})
