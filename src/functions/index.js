import "babel-polyfill"

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

import Recommendation from "./lib/recommendation"
console.log(process.env.VUE_APP_HISTORY_CHUNK_DURATION)
const recommendation = new Recommendation({
  historyChunkDuration: parseInt(process.env.VUE_APP_HISTORY_CHUNK_DURATION || "3600000"),
})

admin.initializeApp(functions.config().firebase)

export const saveHistory = functions.database.ref("/teams/{teamName}/current").onWrite(async (event) => {
  const current = event.data.val()
    , historyKey = recommendation.scaleDate(Date.now())

  try {
    await event.data.ref.parent.child("history").child(historyKey - 2).remove()
  } catch(_) { /* don't care if can't delete matching history */ }
  try {
    await event.data.ref.parent.child("history").child(historyKey - 1).remove()
  } catch(_) { /* don't care if can't delete matching history */ }

  await event.data.ref.parent.child("history").child(historyKey).set(current)
})