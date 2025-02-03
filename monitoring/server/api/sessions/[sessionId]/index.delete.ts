import {deleteFile} from "~/services/server/files/deleteFile";

export default defineEventHandler(event => {
  deleteFile(`./trace-files/${getRouterParam(event, "sessionId")}.txt`)
})
