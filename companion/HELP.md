# PosiStageNet

[https://posistage.net/](https://posistage.net/)

## General
The PosiStageNet sends tracking information as calculated by a positioning system; it defines 2
types of packets to transmit tracking information, the **PSN_DATA** packet and the **PSN_INFO**
packet. 

**PSN_DATA** packets are transmitted when the tracking server is active. The default
transmission rate is 60Hz, however this parameter can be modified on the tracking server and
transmission could go as fast as the tracking hardware supports it (250Hz at the time of this
writing). 

**PSN_INFO** packet is transmitted at a slower rate as it is not supposed to change
as often as positioning information. The default rate of 1Hz is used for **PSN_INFO** packets.

## Communication

The PosiStageNet protocol is transmitted as **UDP multicast** at address **236.10.10.10** over the
port **56565**. These are the defaults parameters and can be modified on the tracking server. 

## Variables

- PSN_INFO_SYSTEM_NAME
  - packet_timestamp uint64
  - version_high uint8
  - version_low uint8
  - frame_id uint8
  - frame_packet_count uint8

- PSN_INFO_TRACKER_LIST

- PSN_DATA_TRACKER_POS
  - pos_x float
  - pos_y float
  - pos_z float

- PSN_DATA_TRACKER_SPEED
  - speed_x float
  - speed_y float
  - speed_z float

- PSN_DATA_TRACKER_ORI
  - ori_x float
  - ori_y float
  - ori_z float

- PSN_DATA_TRACKER_STATUS
  - validity float

- PSN_DATA_TRACKER_ACCEL
  - accel_x float
  - accel_y float
  - accel_z float

- PSN_DATA_TRACKER_TRGTPOS
  - trgtpos_x float
  - trgtpos_y float
  - trgtpos_z float

- PSN_DATA_TRACKER_TIMESTAMP
  - tracker_timestamp uint64