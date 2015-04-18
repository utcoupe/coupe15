Vi = 5;     % m/s
Vm = 15;    % m/s
Acc = 5;    % m/s2
Dd0 = 100;   % m
t0 = 0;

tacc = t0 + (Vm - Vi) / Acc;
Dacc = (Vm*Vm - Vi*Vi)/(Acc*2);
Ddec = (Vm*Vm)/(2*Acc);
Dcst = Dd0 - Dacc - Ddec;
tdec = tacc + Dcst / Vm;
tfin = tdec + Vm/Acc;

figure;
hold on;
line([t0, tacc], [Vi, Vm], 'Color', 'r', 'LineWidth', 4);
line([tacc, tdec], [Vm Vm], 'Color', 'r', 'LineWidth', 4);
line([tdec, tfin], [Vm 0], 'Color', 'r', 'LineWidth', 4);

t = [t0, tfin];
Vacc = (t-t0)*Acc + Vi;
Vdec = (t0-t)*Acc + Vm - Vi + Vi*Vi/(2*Vm) + Acc*D0/Vm;
line(t, Vacc,'LineStyle','--');
line(t, Vdec,'LineStyle','--');
line(t, [Vm Vm],'LineStyle','--');
