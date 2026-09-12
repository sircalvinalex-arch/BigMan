// exportMesocycle.js
//
// Opens a new window with a clean, printable layout of a mesocycle and
// triggers the browser's print dialog — the person picks "Save as PDF"
// as the destination. This avoids adding a PDF-generation library; every
// modern browser already does this reliably.

export function exportMesocycleAsPDF(mesocycle) {
  if (!mesocycle.plan) {
    alert("This mesocycle has no generated plan to export (it was created manually).");
    return;
  }

  const win = window.open("", "_blank");
  if (!win) {
    alert("Your browser blocked the print window — allow pop-ups for this site and try again.");
    return;
  }

  const styles = `
    body { font-family: system-ui, sans-serif; color: #111; padding: 24px; max-width: 700px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
    h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    h3 { font-size: 13px; margin: 12px 0 4px; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px; }
    td, th { text-align: left; padding: 4px 6px; border-bottom: 1px solid #eee; }
    @media print { body { padding: 0; } }
  `;

  const weeksHtml = mesocycle.plan.weekPlans.map((week) => `
    <h2>Week ${week.weekIndex}${week.isDeload ? " (deload)" : ""}</h2>
    ${week.days.map((day) => `
      <h3>Day ${day.dayIndex}</h3>
      <table>
        <tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>RIR</th></tr>
        ${day.exercises.map((ex) => `
          <tr><td>${ex.name}</td><td>${ex.sets}</td><td>${ex.reps}</td><td>${ex.rir}</td></tr>
        `).join("")}
      </table>
    `).join("")}
  `).join("");

  win.document.write(`
    <html>
      <head>
        <title>${mesocycle.name}</title>
        <style>${styles}</style>
      </head>
      <body>
        <h1>${mesocycle.name}</h1>
        <div class="meta">${mesocycle.plan.weeks} weeks · ${mesocycle.plan.daysPerWeek} days/week · ${mesocycle.plan.track} track</div>
        ${weeksHtml}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  // Small delay so the content is fully rendered before the print dialog opens.
  setTimeout(() => win.print(), 300);
}
