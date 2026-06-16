# Ella Site Revival Notes

## Current Project Sources

- Live React/CMS attempt: https://e-bur-react.vercel.app/
- Static interaction prototype repo: https://github.com/valyanggy/ellaTest
- Figma file: https://www.figma.com/design/O3m3lBF4XGDtbYuY7IrXGt/ella-site

## What Is In This Repo

This checkout is the static D3 interaction prototype, not the React/Sanity/Vercel source. It contains:

- `index.html`
- `styles.css`
- `shapeScript.js`
- local prototype images in `img/`
- `work.json` and older script experiments

The Figma node `175:1972` closely matches this static bow/bouquet interaction. The Figma node `156:1120` shows the gallery/calendar view.

## Live Site Failure

The deployed Vercel bundle fetches content from:

```text
https://alex_is_disconnected-ella_burgess.web.val.run/
```

That endpoint still responds with Sanity-shaped content, so the CMS data is not entirely gone.

The live graph fails because the React bundle maps every `gallery` item as if it has:

```js
x.asset._ref
```

But the `Beach` project includes a Vimeo entry:

```json
{
  "_type": "vimeoVideo",
  "caption": "test",
  "url": "https://vimeo.com/212731897"
}
```

Since that item has no `asset`, the app throws:

```text
Sanity Fetch Error TypeError: Cannot read properties of undefined (reading '_ref')
```

## Likely Fix In React Source

When the React/Vercel source is recovered, the content normalization should filter or branch by gallery item type:

```js
h.images = (h.gallery || [])
  .filter((item) => item._type === "imageWithCaption" && item.asset?._ref)
  .map((item) => ({
    imageUrl: sanityImageUrl(item.asset._ref, "hsvfeudq", "ella-burgess"),
    title: item.caption,
  }));
```

Video entries can later become their own node/media type instead of breaking image rendering.

## Local Prototype Fix

`shapeScript.js` had an Observable notebook cleanup call:

```js
invalidation.then(() => simulation.stop());
```

Plain browser pages do not define `invalidation`, so this caused a console error. It is now guarded.
