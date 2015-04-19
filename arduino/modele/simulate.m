function [ t, V, d ] = simulate(Vi, Vm, Acc, Dd0, t0, HZ, inaccuracy_max)
    d = zeros(1, 1);
    V = zeros(1, 1);
    t = zeros(1, 1);
    d(1) = Dd0;
    V(1) = Vi;
    t(1) = t0;
    dt = 1/HZ;
    i = 1;
    while (true)
        [~, Vtarget,~ ] = calcSpeed(V(i), Vm, Acc, d(i), t(i), HZ);
        if length(Vtarget) <= 1; break; end;
        V = [V (Vtarget(2) + (2*(0.5-rand)*inaccuracy_max))];
        d = [d (d(i) - V(i)*dt)];
        t = [t (i*dt)];
        i = i+1;
    end
end

