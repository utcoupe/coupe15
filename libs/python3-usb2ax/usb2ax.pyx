
import sys

ERRBIT_VOLTAGE		 = 1
ERRBIT_ANGLE		 = 2
ERRBIT_OVERHEAT		 = 4
ERRBIT_RANGE		 = 8
ERRBIT_CHECKSUM		 = 16
ERRBIT_OVERLOAD		 = 32
ERRBIT_INSTRUCTION	 = 64

COMM_TXSUCCESS = 0
COMM_RXSUCCESS = 1
COMM_TXFAIL = 2
COMM_RXFAIL = 3
COMM_TXERROR = 4
COMM_RXWAITING = 5
COMM_RXTIMEOUT = 6
COMM_RXCORRUPT = 7
COMM_SYNC_READ_FAIL = 100

MMAP_AX={
    #EEPROM
    "model_no":[0x00,2,False],
    "firmware_version":[0x02,1,False],
    "id":[0x03,1,True],
    "baud_rate":[0x04,1,True],
    "return_delay_time":[0x05,1,True],
    "cw_angle_limit":[0x06,2,True],
    "ccw_angle_limit":[0x08,2,True],

    "high_limit_temp":[0x0B,1,True],
    "low_limit_voltage":[0x0C,1,True],
    "high_limit_voltage":[0x0D,1,True],

    "max_torque":[0x0E,2,True],
    "status_return_level":[0x10,1,True],
    "alarm_led":[0x11,1,True],
    "alarm_shutdown":[0x12,1,True],

    #RAM
    "torque_enable":[0x18,1,True],
    "led":[0x19,1,True],
    "cw_compliance_margin":[0x1A,1,True],
    "ccw_compliance_margin":[0x1B,1,True],
    "cw_compliance_slope":[0x1C,1,True],
    "ccw_compliance_slope":[0x1D,1,True],
    "goal_position":[0x1E,2,True],
    "moving_speed":[0x20,2,True],
    "torque_limit":[0x22,2,True],
    "present_position":[0x24,2,False],
    "present_speed":[0x26,2,False],
    "present_load":[0x28,2,False],
    "present_voltage":[0x2A,1,False],
    "present_temp":[0x2B,1,False],
    "registered":[0x2C,1,False],
    "moving":[0x2E,1,False],
    "lock":[0x2F,1,True],
    "punch":[0x30,2,True]
    }

MMAP_MX={
    #EEPROM
    "model_no":[0x00,2,False],
    "firmware_version":[0x02,1,False],
    "id":[0x03,1,True],
    "baud_rate":[0x04,1,True],
    "return_delay_time":[0x05,1,True],
    "cw_angle_limit":[0x06,2,True],
    "ccw_angle_limit":[0x08,2,True],

    "high_limit_temp":[0x0B,1,True],
    "low_limit_voltage":[0x0C,1,True],
    "high_limit_voltage":[0x0D,1,True],

    "max_torque":[0x0E,2,True],
    "status_return_level":[0x10,1,True],
    "alarm_led":[0x11,1,True],
    "alarm_shutdown":[0x12,1,True],

    #RAM
    "torque_enable":[0x18,1,True],
    "led":[0x19,1,True],
    "d_gain":[0x1A,1,True],
    "i_gain":[0x1B,1,True],
    "p_gain":[0x1C,1,True],
    "goal_position":[0x1E,2,True],
    "moving_speed":[0x20,2,True],
    "torque_limit":[0x22,2,True],
    "present_position":[0x24,2,False],
    "present_speed":[0x26,2,False],
    "present_load":[0x28,2,False],
    "present_voltage":[0x2A,1,False],
    "present_temp":[0x2B,1,False],
    "registered":[0x2C,1,False],
    "moving":[0x2E,1,False],
    "lock":[0x2F,1,True],
    "punch":[0x30,2,True],
    "goal_acceleration":[0x49,1,True]
    }


cdef extern from "dynamixel.h":
    int dxl_initialize( int deviceIndex, int baudnum )
    void dxl_terminate()
    void dxl_set_txpacket_id(int id)
    void dxl_set_txpacket_instruction(int instruction)
    void dxl_set_txpacket_parameter(int index, int value)
    void dxl_set_txpacket_length(int length)

    int dxl_get_rxpacket_error(int errbit)

    int dxl_get_rxpacket_length()
    int dxl_get_rxpacket_parameter(int index)

    int dxl_makeword(int lowbyte, int highbyte)
    int dxl_get_lowbyte(int word)
    int dxl_get_highbyte(int word)
    void dxl_tx_packet()
    void dxl_rx_packet()
    void dxl_txrx_packet()

    int dxl_get_result()
    void dxl_ping(int id)
    int dxl_read_byte(int id, int address)
    void dxl_write_byte(int id, int address, int value)
    int dxl_read_word(int id, int address)
    void dxl_write_word(int id, int address, int value)

cdef dxl_reg_write_word(int id, int address, int value):

    dxl_set_txpacket_id( id )
    dxl_set_txpacket_instruction( 0x04 ) #REG_WRITE instruction
    dxl_set_txpacket_parameter(0, address )
    dxl_set_txpacket_parameter(1, dxl_get_lowbyte(value) )
    dxl_set_txpacket_parameter(2, dxl_get_highbyte(value) )
    dxl_set_txpacket_length( 5 )

    dxl_txrx_packet()

cdef dxl_reg_write_byte(int id, int address, int value):

    dxl_set_txpacket_id( id )
    dxl_set_txpacket_instruction( 0x04 ) #REG_WRITE instruction
    dxl_set_txpacket_parameter(0, address )
    dxl_set_txpacket_parameter(1, value )
    dxl_set_txpacket_length( 4 )

    dxl_txrx_packet()

cdef check_rx_error():
    if dxl_get_rxpacket_error(ERRBIT_VOLTAGE):
        sys.stderr.write( "Voltage error\n")
    if dxl_get_rxpacket_error(ERRBIT_ANGLE ):
        sys.stderr.write( "Angle error\n")
    if dxl_get_rxpacket_error(ERRBIT_OVERHEAT):
        sys.stderr.write( "Overheat error\n")
    if dxl_get_rxpacket_error(ERRBIT_RANGE):
        sys.stderr.write( "Range error\n")
    if dxl_get_rxpacket_error(ERRBIT_CHECKSUM):
        sys.stderr.write( "Checksum error\n")
    if dxl_get_rxpacket_error(ERRBIT_OVERLOAD): 
        sys.stderr.write( "Overload error\n")
    if dxl_get_rxpacket_error(ERRBIT_INSTRUCTION): 
        sys.stderr.write( "Instruction error\n")
     

class InitError(Exception):
    def __init__(self, device_id):
        self.message = "There was a problem connecting to the USB2AX at /dev/ttyACM%d" % device_id

    def __str__(self):
        return self.message

class ReadError(Exception):
    def __init__(self,error_id):
        self.error_id = error_id

    def __str__(self):
        return str(self.error_id)

class UnknownParameterError(Exception):
    def __init__(self, servo_id, parameter, controller):
        self.servo_id = servo_id
        self.parameter = parameter
        self.controller = controller

    def __str__(self):
        return "Servo %d is a %s which does not support the %s parameter" % (
                self.servo_id, self.controller.servo_models[self.servo_id],
                self.parameter )

class InvalidWriteParameterError(Exception):
    pass

class SyncReadError(Exception):
    def __init__(self):
        pass

    def __str__(self):
        return """You tried to sync read but some of your devices
are set to return too slowly. To fix this call initialize with
fix_sync_read_delay = True.
"""

class ServoNotAttachedError(Exception):
    def __init__(self, servo_id):
        self.servo_id = servo_id

    def __str__(self):
        return "Servo with id %d not attached to bus" % self.servo_id

def reset_usb2ax(device_id=0):
    """
    Reset the usb2ax device.
    """

    result = dxl_initialize(device_id,1)
    if result == 0:
        raise InitError(device_id)

    dxl_set_txpacket_id(253) #USB2AX special ID
    dxl_set_txpacket_instruction(0x06) # RESET
    dxl_set_txpacket_length(2)
    dxl_tx_packet()
    status = dxl_get_result()

    print "Device reset, you should unplug it and plug it back in again"

cdef _read(int servo_id, int address, int length):

    cdef int result
    cdef int status

    if length == 1:
        result = dxl_read_byte( servo_id, address )
    else:
        #Only other possibility is length=2 - 2-byte word rather than single byte
        result = dxl_read_word( servo_id, address )

    status = dxl_get_result()

    if status != 1:
        raise ReadError(status)

    return result

class Controller:
    """
    The Controller class is the main action centre for the USB2AX
    interface. You contruct one, use its read, write, sync_read
    and sync_write methods.
    """

    sync_read_ok = True
    servo_list = []
    servo_models = {}
    servo_map = {}

    SYNC_READ_MAX = 9  # Sync reads will be split up to address at most this
                       # number of servos at a time

    def __init__(self, device_id=0, fix_sync_read_delay = False):
        """
        Connect to the USB2AX device.

        Call this before calling anything else.

        The argument goes specifies which ACM device is the
        USB2AX. For example, if the USB2AX is at /dev/ttyACM0,
        call initialize(0) or initialize() (0 is the default
        argument).

        Raises InitError if there was a problem.
        """

        result = dxl_initialize(device_id,1)
        if result == 0:
            raise InitError(device_id)


        sys.stderr.write("""usb2ax: Initiating scan...
usb2ax: USB2AX          : /dev/ttyACM%d
"""% device_id)
        no_devices_connected = True
        for i in range(1,253):

            try:
                model = _read(i, 0x00, 2) #Read model number

                my_map = MMAP_AX
                if model in [12,18]:
                    model = "AX-%d   " % model
                elif model == 29:
                    model = "MX-%dT  " % model
                    my_map = MMAP_MX
                else:
                    model = "Model %d" % model
                sys.stderr.write("usb2ax: %s        : %d\n" % (model, i))
                no_devices_connected =False
                self.servo_list.append(i)
                self.servo_models[i] = model
                self.servo_map[i] = my_map
                try:
                    delay = self.read(i,"return_delay_time")
                    if delay > 5:
                        if fix_sync_read_delay:
                            self.write(i,"return_delay_time",5)
                            try:
                                new_delay = self.read(i,"return_delay_time")
                                sys.stderr.write("usb2ax: INFO: Servo %d return delay set to %d to make compatible with sync_read\n" % (i, new_delay) )
                            except ReadError, e:
                                sys.stderr.write("usb2ax: WARNING: Failed to fix return delay time for servo %d\n" % i )
                                self.sync_read_ok = False

                        else:
                            sys.stderr.write("usb2ax: Delay time is %d -- you cannot use sync_read\n" % delay )
                            sys.stderr.write("usb2ax: To fix this automatically call initialize with fix_sync_read_delay=True\n" )
                            self.sync_read_ok = False

                except ReadError, e:
                    sys.stderr.write("usb2ax: WARNING: Failed to establish return delay time for servo %d\n" % i )
            except ReadError, e:
                #Servo not connected, do nothing
                pass

        if no_devices_connected:
            sys.stderr.write ("usb2ax: WARNING: Cannot see any devices on the bus!\n" )


        try:
            usb2ax_model_no = _read(0xFD, 0x00, 2)
            usb2ax_firmware_version = _read(0xFD, 0x02, 1)

            sys.stderr.write( """usb2ax: Model no.       : %d
usb2ax: Firmware version: %d
usb2ax: Success!
""" % ( usb2ax_model_no, usb2ax_firmware_version ) )
        except ReadError, e:
            sys.stderr.write( """USB2AX: Could not read model and firmare information, this could be a problem...\n""" )
            sys.stderr.write( "Error number %d\n" % e.error_id )

  
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.terminate()

    def terminate(self):
        dxl_terminate()

    def write(self,servo_id,parameter,value,register=False):
        """
        Write to a servos control memory.

        The online documentation lists the supported parameters.

        Call like

        write(1,"goal_position",512)

        To set the target position of the servo with bus ID 1
        to 512 (i.e. the middle).

        If register is True, does not fully perform the write, but buffers
        it in servo memory (the REG_WRITE servo instruction). Call
        action() to make all attached servos performed registered instructions
        """
        if servo_id not in self.servo_map.keys():
            raise ServoNotAttachedError(servo_id)
        MMAP = self.servo_map[servo_id]

        if parameter not in MMAP.keys():
            raise UnknownParameterError(servo_id, parameter, self)

        info = MMAP[parameter]
        if not info[2]:
            print "Parameter %s not writable" % parameter
            raise InvalidWriteParameterError()

        if info[1] == 1:
            if register:
                dxl_reg_write_byte(servo_id, info[0], value)
            else:
                dxl_write_byte(servo_id, info[0], value)
        elif info[1] == 2:
            if register:
                dxl_reg_write_word(servo_id, info[0], value)
            else:
                dxl_write_word(servo_id, info[0], value)

        return

    def read(self,servo_id,parameter):
        """
        Read data from a servo.

        Reads the parameter given from the servo with bus ID servo_id.

        If there is an error, this will raise ReadError. 
        """
        if servo_id not in self.servo_map.keys():
            raise ServoNotAttachedError(servo_id)
        MMAP = self.servo_map[servo_id]

        if parameter not in MMAP.keys():
            raise UnknownParameterError(servo_id, parameter, self)

        info = MMAP[parameter]
        return _read( servo_id, info[0], info[1] )


    def sync_write(self,ids,parameter,values):

        if len(ids) == 0:
            return # Nothing to write

        for servo_id in ids:
            if servo_id not in self.servo_map.keys():
                raise ServoNotAttachedError(servo_id)
            MMAP = self.servo_map[servo_id]
            if parameter not in MMAP.keys():
                raise UnknownParameterError(servo_id, parameter, self)
            info = MMAP[parameter]

        if not info[2]:
            print "Parameter %s not writable" % parameter
            raise InvalidWriteParameterError()

        dxl_set_txpacket_id(254)#Broadcast
        dxl_set_txpacket_instruction(0x83) # Sync write

        param_len = 1 + info[1]

        dxl_set_txpacket_length(param_len*len(ids)+4)

        dxl_set_txpacket_parameter(0,info[0]) 
        dxl_set_txpacket_parameter(1,info[1])

        for i, id in enumerate(ids):
            dxl_set_txpacket_parameter(2+param_len*i,id)
            if info[1] == 2:
                dxl_set_txpacket_parameter(2+param_len*i+1,dxl_get_lowbyte(values[i]))
                dxl_set_txpacket_parameter(2+param_len*i+2,dxl_get_highbyte(values[i]))
            else:
                #Single byte parameter
                dxl_set_txpacket_parameter(2+param_len*i+1,values[i])

        dxl_txrx_packet()
        status = dxl_get_result()

    def sync_read(self,ids,parameter):
        if not self.sync_read_ok:
            raise SyncReadError()


        for servo_id in ids:
            if servo_id not in self.servo_map.keys():
                raise ServoNotAttachedError(servo_id)
            MMAP = self.servo_map[servo_id]
            if parameter not in MMAP.keys():
                raise UnknownParameterError(servo_id, parameter, self)
            info = MMAP[parameter]

        n_servos = len(ids)

        full_result = []

        for i in range(int((n_servos-1)/self.SYNC_READ_MAX + 1)):


            block_ids = ids[i*self.SYNC_READ_MAX:(i+1)*self.SYNC_READ_MAX]

            block_len = len(block_ids)

            dxl_set_txpacket_id(253)#USB2AX reserved ID
            dxl_set_txpacket_instruction(0x84) # Sync read
            dxl_set_txpacket_length(block_len+4)

            dxl_set_txpacket_parameter(0,info[0]) 
            dxl_set_txpacket_parameter(1,info[1])

            for i, id in enumerate(block_ids):
                dxl_set_txpacket_parameter(2+i,id)

            dxl_txrx_packet()
            status = dxl_get_result()
            if status == COMM_RXSUCCESS:
                check_rx_error()
                if info[1] == 2:
                    result = [ dxl_makeword(dxl_get_rxpacket_parameter(2*i),
                        dxl_get_rxpacket_parameter(2*i+1) ) for i in range(block_len) ]
                else:
                    result = [ dxl_get_rxpacket_parameter(i) for i in range(block_len) ]
            else:
                raise ReadError(status)

            full_result.extend(result)

        return full_result

    def reset(self, servo_id):

        dxl_set_txpacket_id(servo_id)
        dxl_set_txpacket_instruction(0x06) # RESET
        dxl_set_txpacket_length(2)
        dxl_txrx_packet()
        status = dxl_get_result()


    def action(self):
        dxl_set_txpacket_id(0xFE)
        dxl_set_txpacket_instruction(0x05) # ACTION
        dxl_set_txpacket_length(2)
        dxl_txrx_packet()
