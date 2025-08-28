# PosiStageNet

Link: [https://posistage.net/](https://posistage.net/)


## Settings

The PosiStageNet protocol is transmitted as **UDP multicast** at address **236.10.10.10** over the
port **56565**. These are the defaults parameters and can be modified on the tracking server. 

## Variables
- System:
  - system_name
  - system_tracker_count
  - system_tracker_ids
- Tracker (id is the identifier):
  - General:
    - tracker_id_name
    - tracker_id_timestamp
    - tracker_id_status 
  - Position:
    - tracker_id_pos_x
    - tracker_id_pos_y
    - tracker_id_pos_z
  - Speed:
    - tracker_id_speed_x
    - tracker_id_speed_y
    - tracker_id_speed_z
  - Orientation:
    - tracker_id_ori_x`
    - tracker_id_ori_y`
    - tracker_id_ori_z`
  - Acceleration:
    - tracker_id_accel_x
    - tracker_id_accel_y
    - tracker_id_accel_z
  - Targetpositon:
    - tracker_id_trgtpos_x
    - tracker_id_trgtpos_y
    - tracker_id_trgtpos_z

## Information
The PosiStageNet sends tracking information as calculated by a positioning system; it defines 2
types of packets to transmit tracking information, the **PSN_DATA** packet and the **PSN_INFO**
packet. 

**PSN_DATA** packets are transmitted when the tracking server is active. The default
transmission rate is 60Hz, however this parameter can be modified on the tracking server and
transmission could go as fast as the tracking hardware supports it (250Hz at the time of this
writing). 

**PSN_INFO** packet is transmitted at a slower rate as it is not supposed to change
as often as positioning information. The default rate of 1Hz is used for **PSN_INFO** packets.
