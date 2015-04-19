function [t, Vtarget, d] = calcSpeed(Vi, Vm, Acc, Dd0, t0, HZ)
    Dsign = sign(Dd0);
    Dd0 = abs(Dd0);
    Vi = Vi*Dsign;
    
    tend = t0 + sqrt(2*Acc*Dd0)/Acc;
    t = linspace(t0, tend, HZ*(tend-t0)+1);
    % Target speed calculation
    Vacc = (t-t0)*Acc + Vi;
    Vdec = (t0-t)*Acc + sqrt(2*Acc*Dd0);
    Vmax = Vm*ones(1,length(t));
    Vtarget = Dsign*min(vertcat(Vacc, Vmax, Vdec));
    
    d = zeros(1,1);
    for v=Vtarget
        d = [d (d(end)+v*(1/HZ))];
    end
    d = d(1:end-1);
end

