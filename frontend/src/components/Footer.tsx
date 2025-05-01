import { FaRegClock } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

const Footer = () => {
	return (
		<div
			className={
				"flex w-full flex-col items-center gap-10 bg-accent p-10"
			}
		>
			<div className={"text-4xl font-bold"}>Code Club UVT</div>

			<div className={"flex w-10/12 gap-20"}>
				<div className={"flex w-1/2 flex-col gap-2"}>
					<div className={"text-justify text-lg font-bold"}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					</div>

					<div className={"flex w-full justify-between"}>
						<div className={"text-lg font-bold"}>
							© 2021 Code Club UVT
						</div>

						<div className={"flex h-8 gap-2"}>
							<img
								src={"/FacebookLogo.png"}
								alt={"Facebook Logo"}
								className={"h-full cursor-pointer"}
								onClick={() =>
									(window.location.href =
										"https://www.facebook.com/CoderDojoUVT")
								}
							/>

							<img
								src={"/InstagramLogo.png"}
								alt={"Instagram Logo"}
								className={"h-full cursor-pointer"}
								onClick={() =>
									(window.location.href =
										"https://www.instagram.com/coderdojo_uvt?igsh=MTExazM4aHFxb2Zqbw==")
								}
							/>
						</div>
					</div>
				</div>

				<div className={"flex w-1/2 flex-col gap-2"}>
					<div className={"flex gap-3 text-lg font-bold"}>
						<FaRegClock className={"h-6 w-7 pl-1 text-white"} />

						<div>Sambata, intre orele 10:30 si 12:30</div>
					</div>

					<div
						className={"flex items-center gap-2 text-lg font-bold"}
					>
						<IoLocationOutline className={"h-8 w-8 text-white"} />

						<div>
							Sediul central UVT
							<br />
							Bulevardul Vasile Pârvan, nr. 4, Timișoara
						</div>
					</div>
				</div>
			</div>

			<img
				src={"/RaspberryPiLogo.png"}
				alt={"Raspberry Pi Logo"}
				className={"h-16 cursor-pointer"}
				onClick={() =>
					(window.location.href = "https://www.raspberrypi.org/")
				}
			/>
		</div>
	);
};

export default Footer;
