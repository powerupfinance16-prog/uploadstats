import { Employee, Account, DailyRecord } from '../types';
import { formatDateFull } from './dateUtils';

export function generateWhatsAppReport(
  dateStr: string,
  employees: Employee[],
  accounts: Account[],
  records: Record<string, DailyRecord>
): string {
  const formattedDate = formatDateFull(dateStr);
  const lines: string[] = [
    '📊 *FocusFlow Team Upload Report*',
    `🗓️ Date: ${formattedDate}`,
    '━━━━━━━━━━━━━━━━━━━━━',
  ];

  let totalTeamUploaded = 0;
  let totalTeamTarget = 0;

  // Process assigned employees
  employees.forEach((emp) => {
    const empAccounts = accounts.filter((acc) => acc.employeeId === emp.id);
    if (empAccounts.length === 0) return;

    let empUploaded = 0;
    let empTarget = 0;
    const accountLines: string[] = [];

    empAccounts.forEach((acc) => {
      const rec = records[`${dateStr}_${acc.id}`];
      const uploaded = rec ? rec.uploadedClips : 0;
      empUploaded += uploaded;
      empTarget += acc.targetDailyClips;
      accountLines.push(`     - ${acc.username}: ${uploaded}/${acc.targetDailyClips}`);
    });

    totalTeamUploaded += empUploaded;
    totalTeamTarget += empTarget;

    let statusEmoji = '❌';
    if (empTarget > 0 && empUploaded >= empTarget) {
      statusEmoji = '✅';
    } else if (empUploaded > 0) {
      statusEmoji = '⏳';
    }

    lines.push(`👤 *${emp.name}*`);
    lines.push(`   • Uploads: ${empUploaded} / ${empTarget} videos ${statusEmoji}`);
    accountLines.forEach((al) => lines.push(al));
  });

  // Check unassigned accounts
  const unassignedAccounts = accounts.filter((acc) => !acc.employeeId);
  if (unassignedAccounts.length > 0) {
    let unassignedUploaded = 0;
    let unassignedTarget = 0;
    const unassignedLines: string[] = [];

    unassignedAccounts.forEach((acc) => {
      const rec = records[`${dateStr}_${acc.id}`];
      const uploaded = rec ? rec.uploadedClips : 0;
      unassignedUploaded += uploaded;
      unassignedTarget += acc.targetDailyClips;
      unassignedLines.push(`     - ${acc.username}: ${uploaded}/${acc.targetDailyClips}`);
    });

    if (unassignedTarget > 0) {
      lines.push(`⚠️ *Unassigned Accounts*`);
      lines.push(`   • Uploads: ${unassignedUploaded} / ${unassignedTarget} videos`);
      unassignedLines.forEach((al) => lines.push(al));
    }
  }

  const teamPercentage = totalTeamTarget > 0
    ? Math.round((totalTeamUploaded / totalTeamTarget) * 100)
    : 0;

  lines.push('━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📈 *Team Total*: ${totalTeamUploaded} / ${totalTeamTarget} Videos Uploaded (${teamPercentage}%)`);
  lines.push('⚡ Focus. Ship. Repeat.');

  return lines.join('\n');
}

export function getWhatsAppWebUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
