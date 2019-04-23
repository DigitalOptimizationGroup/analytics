import { Observable } from "rxjs";

export type Visibility = VisibilityState | "noBrowserSupport";

export type VisibilityEvent = {
  visibility: Visibility;
};

export const visibility$ = new Observable<VisibilityEvent>(observer => {
  if (document.visibilityState === undefined) {
    observer.next({
      visibility: "noBrowserSupport"
    });
    /*
    this should probably never complete as it is used by the timers
    observer.complete()
    */
    return () => {};
  } else {
    const handleChange = () => {
      observer.next({
        // visible, prerender, hidden
        visibility: document.visibilityState
      });
    };

    // start with the current value
    handleChange();

    // listen for changes
    document.addEventListener("visibilitychange", handleChange);

    return () => {
      document.removeEventListener("visibilitychange", handleChange);
    };
  }
});

/*
Some much older browsers do not have support or require prefixes. If looking for old browser support these look promising:
https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
https://github.com/ai/visibilityjs
https://gist.github.com/addyosmani/1122546/9484e93818db69b9bcacf2448c293a33c930be80
*/

// Browsers have added an even for this, but Android webview has it at 4.4.3 and we still see a lot of 4.2
// https://developer.mozilla.org/en-US/docs/Web/API/Document/onvisibilitychange
