-- P7: Admin / Content Management UI — Qasberry Learning Overhaul
-- Purely additive: one new nullable column on "lessons". No existing row is
-- affected (defaults to NULL, matching every current lesson's un-set state).
--
-- Populated by the video.asset.errored webhook handler
-- (app/api/webhooks/mux/route.ts) so the admin UI can show a real Mux
-- processing error instead of polling forever. Never written anywhere else.

ALTER TABLE "lessons" ADD COLUMN     "muxError" TEXT;
