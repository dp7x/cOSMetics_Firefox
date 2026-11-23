# Firefox 2.11 — manual checks

Load `manifest.json` through `about:debugging#/runtime/this-firefox` →
**Load Temporary Add-on**, then refresh iD. Temporary installation ends when
Firefox closes. The package is unsigned; permanent installation requires
Mozilla signing.

- Confirm the popup displays **2.11** and all six feature sections. Check the
  interface in the browser language and that the Save button stays visible.
- Bricks, Sensei and Shapes should start disabled. Enable them in the popup,
  reopen the popup to check their switches, then reload iD to verify they reset.
  Tool preferences should remain saved; other open tabs should be independent.
- In Bricks, load Overture buildings at zoom 18 or higher, select an outline
  and add it with A. Confirm there is no constructor permission error.
- Press 4 and draw a building with three clicks. Test corner/wall snapping,
  selection after drawing, Esc cancellation and undo. Shared nodes should
  connect attached buildings correctly.
- Press 5 to draw an orthogonal outline; use Shift for a free angle. Press 6
  on a selected building, choose a side and confirm the semicircle.
- In Shapes, select a simple area and use Vertex Resumer to continue from
  an existing vertex. Check cancellation and Ctrl+Z.
- In Sensei, import a small Overpass JSON or GeoJSON file. Test replacement,
  removal, manual review, Skip and Previous. Already corrected objects should
  be skipped during forward navigation. Verify changes in iD before uploading.
- In Ockham, select a line or polygon, adjust tolerance, preview with 9 and
  apply with 0. Test Undo and confirm protected nodes remain.
- Download a grid in edit mode: it should also appear as custom data. Existing
  custom data should require confirmation before replacement. Outside iD,
  only the download should be available.
- Generate an OSMradamus comment in the save dialog. Confirm there is no
  blocked `blob:` request. Check persistent hashtags, including with a manual
  comment, and verify the normal iD upload workflow.
- Save and apply a custom background. Check the popup's help links, dragging,
  panel collapse buttons and light/dark appearance.

Use a small test area and review the local edit history. No upload is needed
to check drawing, preview, corrections or undo.
