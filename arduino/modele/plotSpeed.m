function [] = plotSpeed( Vi, Vm, Acc, Dd0, t0, HZ)
    Dsign = sign(Dd0);
    Dd0 = abs(Dd0);
    Vi = Vi*Dsign;

    % All time calculations are only used to 
    % compute tend, which is only used to display
    % the plot correctly   
    tacc = t0 + (Vm - Vi) / Acc;
    Dacc = (Vm*Vm - Vi*Vi)/(Acc*2);
    Ddec = (Vm*Vm)/(2*Acc);
    Dcst = Dd0 - Dacc - Ddec;
    tdec = tacc + Dcst / Vm;
    tend = tdec + Vm/Acc;

    hold on;
    xlabel('Time (s)');
    ylabel('Speed (m/s)');
    
    % Ideal model %
    %line([t0, tacc], [Vi, Vm], 'Color', 'r', 'LineWidth', 4);
    %line([tacc, tdec], [Vm Vm], 'Color', 'r', 'LineWidth', 4);
    %line([tdec, tfin], [Vm 0], 'Color', 'r', 'LineWidth', 4);
    
    % Acceleration, constant and deceleration speed calculations
    t = [t0, tend];
    Vacc = (t-t0)*Acc + Vi;
    Vdec = (t0-t)*Acc + Vm - Vi + Vi*Vi/(2*Vm) + Acc*Dd0/Vm;
    Vmax = Vm*ones(1,length(t));
    line(t, Dsign*Vacc,'LineStyle','--');
    line(t, Dsign*Vdec,'LineStyle','--');
    line(t, Dsign*Vmax,'LineStyle','--');
    
    % Target speed calculation
    t = linspace(t0, tend, HZ*(tend-t0));
    Vacc = (t-t0)*Acc + Vi;
    Vdec = (t0-t)*Acc + Vm - Vi + Vi*Vi/(2*Vm) + Acc*Dd0/Vm;
    Vmax = Vm*ones(1,length(t));
    Vtarget = Dsign*min(vertcat(Vacc, Vmax, Vdec));
    plot(t, Vtarget, 'Color', 'r', 'LineWidth', 4);
end

