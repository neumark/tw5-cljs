; module-type: library
;
;A sync adaptor module for synchronising with firestore under node.js
; based on https://gist.github.com/pesterhazy/39c84224972890665b6bec3addafdf5a

(ns browser-firestoresyncadaptor.core)

(comment
  (def sam-api (js/require "$:/plugins/neumark/syncadaptormanager/sam-api.js"))

  (js/console.log "browser-firestoresyncadaptor sam-api" sam-api)

  (defn FirestoreAdaptor [options]
    (this-as this
             (.call (.-IPromiseSyncAdaptor sam-api) this)))

  (js/goog.object.extend (.-prototype FirestoreAdaptor)
                         (.-prototype sam-api)
                         #js {:readAll (fn [] (js/console.log "browser-firestoresyncadaptor readAll"))
                              :getStatus nil
                              :login nil
                              :logout nil
                              :readSkinny nil}))

(def ^:export adaptorClass #js {})


