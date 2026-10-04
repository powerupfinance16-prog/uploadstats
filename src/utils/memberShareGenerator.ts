import { Employee, Account, DailyRecord } from '../types';
import { formatDateFull, formatDateShort, formatDayOfWeek, parseDateString, toDateString } from './dateUtils';

export interface MemberDailyStats {
  employee: Employee;
  dateStr: string;
  totalUploaded: number;
  totalTarget: number;
  quotaPct: number;
  isMet: boolean;
  isPartial: boolean;
  streak: number;
  dailyEarnings: number;
  accounts: {
    account: Account;
    uploaded: number;
    target: number;
    met: boolean;
  }[];
  recentHabitDays: {
    dateStr: string;
    dayName: string;
    uploaded: number;
    target: number;
    met: boolean;
    partial: boolean;
    isSelected: boolean;
  }[];
}

export function computeMemberDailyStats(
  employee: Employee,
  dateStr: string,
  accounts: Account[],
  records: Record<string, DailyRecord>,
  allDates: string[]
): MemberDailyStats {
  const empAccounts = accounts.filter((a) => a.employeeId === employee.id);
  
  let totalUploaded = 0;
  let totalTarget = 0;

  const accountsData = empAccounts.map((acc) => {
    const rec = records[`${dateStr}_${acc.id}`];
    const uploaded = rec ? rec.uploadedClips : 0;
    const target = acc.targetDailyClips;
    totalUploaded += uploaded;
    totalTarget += target;
    return {
      account: acc,
      uploaded,
      target,
      met: target > 0 && uploaded >= target,
    };
  });

  const quotaPct = totalTarget > 0 ? Math.round((totalUploaded / totalTarget) * 100) : 0;
  const isMet = totalTarget > 0 && totalUploaded >= totalTarget;
  const isPartial = totalUploaded > 0 && totalUploaded < totalTarget;

  // Calculate streak ending at this date
  let streak = 0;
  const refDate = parseDateString(dateStr);

  for (let i = 0; i < 30; i++) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    const dStr = toDateString(d);
    
    let dUploaded = 0;
    empAccounts.forEach((acc) => {
      const rec = records[`${dStr}_${acc.id}`];
      if (rec) dUploaded += rec.uploadedClips;
    });

    if (totalTarget > 0 && dUploaded >= totalTarget) {
      streak++;
    } else {
      break;
    }
  }

  // Exact 7-day habit strip ending on dateStr (e.g. Sun through Sat)
  const recentHabitDays: MemberDailyStats['recentHabitDays'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    const dStr = toDateString(d);
    const dayName = formatDayOfWeek(dStr);

    let dUploaded = 0;
    empAccounts.forEach((acc) => {
      const rec = records[`${dStr}_${acc.id}`];
      if (rec) dUploaded += rec.uploadedClips;
    });

    recentHabitDays.push({
      dateStr: dStr,
      dayName,
      uploaded: dUploaded,
      target: totalTarget,
      met: totalTarget > 0 && dUploaded >= totalTarget,
      partial: totalTarget > 0 && dUploaded > 0 && dUploaded < totalTarget,
      isSelected: dStr === dateStr,
    });
  }

  const rate = employee.ratePerVideo || 50;
  const dailyEarnings = totalUploaded * rate;

  return {
    employee,
    dateStr,
    totalUploaded,
    totalTarget,
    quotaPct,
    isMet,
    isPartial,
    streak,
    dailyEarnings,
    accounts: accountsData,
    recentHabitDays,
  };
}

export function generateMemberWhatsAppText(stats: MemberDailyStats): string {
  const { employee, dateStr, totalUploaded, totalTarget, quotaPct, isMet, isPartial, streak, dailyEarnings, accounts } = stats;
  const formattedDate = formatDateFull(dateStr);

  const statusEmoji = isMet ? '✅ Quota Met' : isPartial ? '⏳ In Progress' : '❌ Missed';

  const lines: string[] = [
    `🌟 *FocusFlow Daily Creator Report*`,
    `🗓️ *Date*: ${formattedDate}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Creator*: ${employee.name}`,
    `🎯 *Today's Quota*: ${totalUploaded} / ${totalTarget} Videos (${quotaPct}%) ${statusEmoji}`,
    `🔥 *Active Streak*: ${streak} Days in a row!`,
    `💰 *Estimated Earnings*: ₹${dailyEarnings.toLocaleString()} (₹${employee.ratePerVideo || 50}/clip)`,
    ``,
    `📱 *Account Breakdown*:`,
  ];

  accounts.forEach((acc) => {
    const mark = acc.met ? '✅' : acc.uploaded > 0 ? '⏳' : '❌';
    lines.push(`   • ${acc.account.username}: ${acc.uploaded} / ${acc.target} clips ${mark}`);
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  if (isMet) {
    lines.push(`⚡ Incredible discipline & speed! Keep up the momentum! 🔥`);
  } else {
    lines.push(`⚡ Push for the finish line! Focus. Ship. Repeat.`);
  }

  return lines.join('\n');
}

/**
 * Draws the exact visual card matching the Apple-style FocusFlow design:
 * - Rounded 3xl white card
 * - Gradient blue squircle brand icon
 * - Flow in vibrant blue
 * - Status pill (In Progress / Quota Met)
 * - Circular progress ring gauge
 * - Horizontal bar with percentage
 * - Account breakdown card
 * - 7-day strip with highlighted day
 */
export function drawMemberStatsCard(
  canvas: HTMLCanvasElement,
  stats: MemberDailyStats
): void {
  const width = 1080;
  const height = 1080;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { employee, dateStr, totalUploaded, totalTarget, quotaPct, isMet, accounts, recentHabitDays } = stats;

  // 1. Outer canvas background (soft Apple neutral gray)
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, width, height);

  // 2. White Card Container
  const pad = 44;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const cardRadius = 36;

  // Soft shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;

  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, cardRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Outer border
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, cardRadius);
  ctx.stroke();

  // 3. Top Header Bar
  const headerY = pad + 40;
  const brandX = pad + 40;

  // Blue Brand Squircle Icon
  const brandGradient = ctx.createLinearGradient(brandX, headerY, brandX + 54, headerY + 54);
  brandGradient.addColorStop(0, '#38BDF8');
  brandGradient.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = brandGradient;
  ctx.beginPath();
  ctx.roundRect(brandX, headerY, 54, 54, 16);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('F', brandX + 27, headerY + 38);

  // Brand Name: FOCUSFLOW (FOCUS in #0F172A, FLOW in #2563EB)
  ctx.textAlign = 'left';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('FOCUS', brandX + 68, headerY + 28);
  const focusWidth = ctx.measureText('FOCUS').width;
  ctx.fillStyle = '#2563EB';
  ctx.fillText('FLOW', brandX + 68 + focusWidth, headerY + 28);

  // Subtitle: CREATOR DAILY BRIEF
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('CREATOR DAILY BRIEF', brandX + 68, headerY + 48);
  ctx.letterSpacing = '0px';

  // Status Badge Pill (Top Right)
  const isComplete = isMet;
  const badgeText = isComplete ? 'QUOTA MET' : 'IN PROGRESS';
  const badgeW = 160;
  const badgeH = 42;
  const badgeX = pad + cardW - 40 - badgeW;
  const badgeY = headerY + 6;

  ctx.fillStyle = isComplete ? '#ECFDF5' : '#EFF6FF';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 21);
  ctx.fill();

  // Status Dot
  ctx.fillStyle = isComplete ? '#10B981' : '#2563EB';
  ctx.beginPath();
  ctx.arc(badgeX + 24, badgeY + 21, 5, 0, Math.PI * 2);
  ctx.fill();

  // Status Text
  ctx.fillStyle = isComplete ? '#047857' : '#1D4ED8';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(badgeText, badgeX + 38, badgeY + 26);

  // 4. Creator Profile Section
  const profileY = headerY + 80;
  const avatarSize = 82;
  const avatarX = pad + 40;

  // Avatar Gradient Circle
  const avGrad = ctx.createLinearGradient(avatarX, profileY, avatarX + avatarSize, profileY + avatarSize);
  avGrad.addColorStop(0, '#2563EB');
  avGrad.addColorStop(1, '#38BDF8');
  ctx.fillStyle = avGrad;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, profileY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.textAlign = 'center';
  const initials = employee.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  ctx.fillText(initials, avatarX + avatarSize / 2, profileY + avatarSize / 2 + 11);

  // Name & Role & Date
  const textX = avatarX + avatarSize + 22;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText(employee.name, textX, profileY + 34);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText(employee.role || 'Short-Form Specialist', textX, profileY + 60);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  const dateFormatted = formatDateFull(dateStr);
  ctx.fillText(`🗓️  ${dateFormatted}`, textX, profileY + 84);

  // 5. Section 1: "TODAY'S PROGRESS" Card Container
  const progY = profileY + avatarSize + 32;
  const progW = cardW - 80;
  const progH = 220;

  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.roundRect(pad + 40, progY, progW, progH, 24);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Circular Ring Gauge on Left of Progress Card
  const gaugeCenterX = pad + 40 + 120;
  const gaugeCenterY = progY + progH / 2;
  const gaugeRadius = 66;

  // Background Ring
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Progress Arc
  const pctRatio = Math.min(1, totalTarget > 0 ? totalUploaded / totalTarget : 0);
  if (pctRatio > 0) {
    const arcGradient = ctx.createLinearGradient(gaugeCenterX - gaugeRadius, gaugeCenterY, gaugeCenterX + gaugeRadius, gaugeCenterY);
    arcGradient.addColorStop(0, '#38BDF8');
    arcGradient.addColorStop(1, '#2563EB');
    ctx.strokeStyle = arcGradient;
    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + pctRatio * Math.PI * 2;
    ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, startAngle, endAngle);
    ctx.stroke();
  }

  // Inside Gauge Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText(`${totalUploaded} / ${totalTarget}`, gaugeCenterX, gaugeCenterY + 4);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText('Uploads', gaugeCenterX, gaugeCenterY + 26);

  // Right Side of Progress Card
  const rightX = gaugeCenterX + gaugeRadius + 44;
  const rightTopY = progY + 48;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText("TODAY'S PROGRESS", rightX, rightTopY);
  ctx.letterSpacing = '0px';

  // Big Typography: 2 / 4 (2 in blue, / 4 in dark)
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillStyle = '#2563EB';
  ctx.fillText(`${totalUploaded}`, rightX, rightTopY + 54);
  const upW = ctx.measureText(`${totalUploaded}`).width;
  ctx.fillStyle = '#0F172A';
  ctx.fillText(` / ${totalTarget}`, rightX + upW, rightTopY + 54);

  // Horizontal Progress Bar
  const barY = rightTopY + 76;
  const barW = progW - (rightX - (pad + 40)) - 100;
  const barH = 14;

  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.roundRect(rightX, barY, barW, barH, 7);
  ctx.fill();

  if (pctRatio > 0) {
    const barGrad = ctx.createLinearGradient(rightX, barY, rightX + barW * pctRatio, barY);
    barGrad.addColorStop(0, '#38BDF8');
    barGrad.addColorStop(1, '#2563EB');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(rightX, barY, Math.max(14, barW * pctRatio), barH, 7);
    ctx.fill();
  }

  // Percentage text on right of bar
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText(`${quotaPct}%`, rightX + barW + 18, barY + 12);

  // Microcopy below bar
  ctx.fillStyle = '#64748B';
  ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  const remaining = Math.max(0, totalTarget - totalUploaded);
  const motivateText = remaining === 0
    ? 'Target met! Outstanding consistency today. 🔥'
    : `Keep going! ${remaining} more to complete today.`;
  ctx.fillText(motivateText, rightX, barY + 38);

  // 6. Section 2: "ACCOUNT BREAKDOWN"
  const accSectionY = progY + progH + 34;

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('ACCOUNT BREAKDOWN', pad + 40, accSectionY);
  ctx.letterSpacing = '0px';

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillText(`${accounts.length} Assigned Channel${accounts.length === 1 ? '' : 's'}`, pad + cardW - 40, accSectionY);

  // First Account Row Card
  const accCardY = accSectionY + 14;
  const accRowH = 74;
  const primaryAcc = accounts[0];

  if (primaryAcc) {
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(pad + 40, accCardY, progW, accRowH, 18);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dark circle icon
    const iconX = pad + 56;
    const iconY = accCardY + 14;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(iconX + 23, iconY + 23, 23, 0, Math.PI * 2);
    ctx.fill();

    // Dumbbell / Media symbol inside icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▶', iconX + 24, iconY + 29);

    // Channel name & niche
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillText(primaryAcc.account.username, iconX + 60, iconY + 22);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillText(primaryAcc.account.niche || 'Workouts & Nutrition', iconX + 60, iconY + 42);

    // Count on right: 2 / 4 >
    const rightSideX = pad + cardW - 60;
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('>', rightSideX, iconY + 30);

    ctx.fillStyle = '#0F172A';
    ctx.fillText(` / ${primaryAcc.target}`, rightSideX - 22, iconY + 30);
    const targetW = ctx.measureText(` / ${primaryAcc.target}`).width;

    ctx.fillStyle = '#2563EB';
    ctx.fillText(`${primaryAcc.uploaded}`, rightSideX - 22 - targetW, iconY + 30);
  }

  // 7. Section 3: 7-Day Consistency Strip (Sun -> Sat)
  const stripY = accCardY + accRowH + 24;
  const stripCardW = (progW - 12 * 6) / 7;
  const stripCardH = 120;

  recentHabitDays.forEach((h, idx) => {
    const cardX = pad + 40 + idx * (stripCardW + 12);
    const isTodayCard = h.isSelected;

    // Card background
    ctx.fillStyle = isTodayCard ? '#EFF6FF' : '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(cardX, stripY, stripCardW, stripCardH, 18);
    ctx.fill();

    ctx.lineWidth = isTodayCard ? 2 : 1;
    ctx.strokeStyle = isTodayCard ? '#2563EB' : '#E2E8F0';
    ctx.stroke();

    // Day Name
    ctx.textAlign = 'center';
    ctx.fillStyle = isTodayCard ? '#2563EB' : '#475569';
    ctx.font = isTodayCard ? 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif' : '600 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(h.dayName, cardX + stripCardW / 2, stripY + 28);

    // Circular Icon Status
    const iconCenterY = stripY + 60;
    const iconCenterX = cardX + stripCardW / 2;

    if (h.met) {
      // Emerald Green Filled with checkmark
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('✓', iconCenterX, iconCenterY + 5);
    } else if (h.partial) {
      // Amber arc
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 13, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (isTodayCard) {
      // Blue arc
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 13, -Math.PI / 2, Math.PI / 4);
      ctx.stroke();
    } else {
      // Empty Slate Ring
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 13, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Upload count below
    ctx.fillStyle = isTodayCard ? '#1E40AF' : '#475569';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${h.uploaded} / ${h.target}`, iconCenterX, stripY + 102);
  });
}
