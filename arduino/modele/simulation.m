%% SIMULATION %%
% inaccuraccy is max difference between V and Vtarget at any time (m/s)

figure;
Vi = 0.3;   % m/s
Vm = 1;     % m/s
Acc = 0.4;  % m/s2
Dd0 = -0.5;    % m
t0 = 0;
HZ = 100;
plotSimulation(Vi, Vm, Acc, Dd0, t0, HZ, 0.01, 'r');
plotSimulation(Vi, Vm, Acc, Dd0, t0, HZ, 0.005, 'b');
plotSimulation(Vi, Vm, Acc, Dd0, t0, HZ, 0, 'g');

figure;
Vi = 0;   % m/s
Vm = 1;     % m/s
Acc = 0.4;  % m/s2
Dd0 = 5;    % m
t0 = 0;
HZ = 100;
plotSimulation(Vi, Vm, Acc, Dd0, t0, HZ, 0.01, 'r');
plotSimulation(Vi, Vm, Acc, Dd0, t0, HZ, 0.005, 'b');
plotSimulation(Vi, Vm, Acc, Dd0, t0, HZ, 0, 'g');