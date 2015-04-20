function [t, Vtarget, d] = calcSpeed(Vi, Vm, Acc, dd, HZ)
    Dsign = sign(dd);
    dd = abs(dd);
    Vi = Vi*Dsign;
    
    tend = sqrt(2*Acc*dd)/Acc;
    t = linspace(0, tend, HZ*(tend)+1);
    % Target speed calculation
    Vacc = t*Acc + Vi;
    Vdec = -t*Acc + sqrt(2*Acc*dd);
    Vmax = Vm*ones(1,length(t));
    Vtarget = Dsign*min(vertcat(Vacc, Vmax, Vdec));
    
    d = zeros(1,1);
    for v=Vtarget
        d = [d (d(end)+v*(1/HZ))];
    end
    d = d(1:end-1);
end

