import { FaRegClock } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import Container from "./layout/Container";

const Footer = () => {
	return (
		<div className="bg-accent w-full py-8 sm:py-10">
			<Container className="flex flex-col items-center gap-6 sm:gap-10">
				<div className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">
					Code Club UVT
				</div>

				<div className="flex w-full flex-col gap-8 md:flex-row md:gap-10 lg:gap-20">
					<div className="flex flex-col gap-4 md:w-1/2">
						<div className="text-justify text-sm font-bold sm:text-base md:text-lg">
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit. Lorem ipsum dolor sit amet,
							consectetur adipiscing elit. Lorem ipsum dolor sit
							amet, consectetur adipiscing elit.
						</div>

						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="text-center text-sm font-bold sm:text-left sm:text-base md:text-lg">
								© {new Date().getFullYear()} Code Club UVT
							</div>

							<div className="flex h-8 justify-center gap-2 sm:justify-end">
								<img
									src={"/FacebookLogo.png"}
									alt={"Facebook Logo"}
									className="h-full cursor-pointer"
									onClick={() =>
										window.open(
											"https://www.facebook.com/CoderDojoUVT",
											"_blank",
										)
									}
								/>

								<img
									src={"/InstagramLogo.png"}
									alt={"Instagram Logo"}
									className="h-full cursor-pointer"
									onClick={() =>
										window.open(
											"https://www.instagram.com/coderdojo_uvt?igsh=MTExazM4aHFxb2Zqbw==",
											"_blank",
										)
									}
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4 md:w-1/2">
						<div className="flex flex-col justify-center gap-2 text-sm font-bold sm:flex-row sm:items-center sm:gap-3 sm:text-base md:justify-start md:text-lg">
							<FaRegClock className="mx-auto h-5 w-5 pl-1 text-white sm:mx-0 sm:h-6 sm:w-7" />
							<div className="text-center sm:text-left">
								Sambata, intre orele 10:30 si 12:30
							</div>
						</div>

						<div className="flex flex-col items-center gap-2 text-sm font-bold sm:flex-row sm:text-base md:text-lg">
							<IoLocationOutline className="mx-auto h-6 w-6 text-white sm:mx-0 sm:h-8 sm:w-8" />
							<div className="text-center sm:text-left">
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
					className="mt-2 h-12 cursor-pointer sm:h-16"
					onClick={() =>
						window.open("https://www.raspberrypi.org/", "_blank")
					}
				/>
			</Container>
		</div>
	);
};

export default Footer;
