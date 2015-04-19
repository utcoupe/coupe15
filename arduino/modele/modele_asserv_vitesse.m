Vi = 0.3;   % m/s
Vm = 1;     % m/s
Acc = 0.4;  % m/s2
Dd0 = 5;    % m
t0 = 0;
HZ = 100;

figure;
subplot(2,3,1);
plotSpeed(Vi, Vm, Acc, Dd0, t0, HZ);
title('Typical use');

HZ = 1;
subplot(2,3,2);
plotSpeed(Vi, Vm, Acc, Dd0, t0, HZ);
title('Low Sampling Speed');

Dd0 = 1;   % m
HZ = 100;
subplot(2,3,3);
plotSpeed(Vi, Vm, Acc, Dd0, t0, HZ);
title('Short distance');

Dd0 = -5;   % m
subplot(2,3,5);
plotSpeed(Vi, Vm, Acc, Dd0, t0, HZ);
title('Negative distance with positive initial speed');

Vi = -0.3;
subplot(2,3,4);
plotSpeed(Vi, Vm, Acc, Dd0, t0, HZ);
title('Negative distance');

Dd0 = -1;   % m
subplot(2,3,6);
plotSpeed(Vi, Vm, Acc, Dd0, t0, HZ);
title('Short negative distance');