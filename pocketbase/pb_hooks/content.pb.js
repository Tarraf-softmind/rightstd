/// <reference path="../pb_data/types.d.ts" />

// Contact form: drop bots that fill the hidden "website" field, then email the message to the site address.
onRecordCreateRequest((e) => {
  if (e.requestInfo().body["website"]) throw new BadRequestError("Invalid submission.")
  e.next()
  const meta = e.app.settings().meta
  if (!e.app.settings().smtp.enabled) return // shortcut: messages only land in the admin until SMTP is set in Settings > Mail
  try {
    const s = e.app.findFirstRecordByFilter("settings", "id != ''")
    const r = e.record
    const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
    e.app.newMailClient().send(new MailerMessage({
      from: { address: meta.senderAddress, name: meta.senderName },
      to: [{ address: s.get("email") }],
      headers: { "Reply-To": r.get("email") },
      subject: "New website message from " + r.get("first_name") + " " + r.get("last_name"),
      html: "<p><b>" + esc(r.get("first_name") + " " + r.get("last_name")) + "</b> &lt;" + esc(r.get("email")) + "&gt;</p><p>" + esc(r.get("message")).replace(/\n/g, "<br>") + "</p>",
    }))
  } catch (err) {
    e.app.logger().error("contact mail failed", "error", String(err)) // message is still saved
  }
}, "messages")

// Rebuild the static site whenever content changes (runs in the background, debounced by the script).
const rebuild = (e) => {
  e.next()
  try {
    $os.cmd("sh", "-c", `nohup "${__hooks}/../../scripts/rebuild.sh" >> "${__hooks}/../build.log" 2>&1 &`).start()
  } catch (_) {} // PocketBase Cloud has no scripts/, node or rsync: saving still works, redeploy with pbc instead
}
onRecordAfterCreateSuccess(rebuild, "settings", "pages", "services", "clients", "showcase")
onRecordAfterUpdateSuccess(rebuild, "settings", "pages", "services", "clients", "showcase")
onRecordAfterDeleteSuccess(rebuild, "settings", "pages", "services", "clients", "showcase")
