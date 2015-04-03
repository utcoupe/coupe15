#include "protocol.h"
#include "compat.h"
#include "serial_switch.h"

void sendResponse(char order, char *buf, int size){
	int i;
	serial_send(order);
	serial_send(';');
	for (i=0; i<size; i++){
		serial_send(buf[i]);
	}
	serial_send('\n');
}

void clean_current_command(char *buffer, int* end_of_cmd) {
	memcpy(buffer, buffer+*end_of_cmd, MAX_COMMAND_LEN-*end_of_cmd);
	*end_of_cmd = 0;
}

int executeCmd(char data) {
	static char current_command[MAX_COMMAND_LEN];
	static int index = 0;
	if (data == '\r') data = '\n';
	current_command[index++] = data;
	if (data == '\n') {
		// end of current command
		char order = current_command[0];
		char response[MAX_RESPONSE_LEN];
		int id, end_of_id, response_size;
		current_command[index] = '\0';
		end_of_id = ID_START_INDEX; // start after first ';'
		while (current_command[end_of_id] != ';') {
			end_of_id++;
			if (end_of_id >= MAX_ID_LEN+ID_START_INDEX) {
				clean_current_command(current_command, &index);
				Serial.print(FAILED_MSG);
				return -1;
			}
		}
		current_command[end_of_id] = '\0';
		sscanf(&current_command[ID_START_INDEX], "%i", &id);

		switchOrdre(order, id, &current_command[end_of_id+1], response, &response_size);
		sendResponse(order, response, response_size);
		clean_current_command(current_command, &index);
	}
	if (index >= MAX_COMMAND_LEN) {
		// epic fail, this MUST NEVER happen
		// if ever this happens, the order will be corrupted
		// decrease index so the arduino keep going on
		// that means we overwrite the last received char
		index--;
		return 1;
	}
	return 0;
}
