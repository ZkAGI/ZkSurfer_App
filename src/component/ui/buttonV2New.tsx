"use client";

const ButtonV2New = ({
    isSubmitting,
    onClick,
}: {
    isSubmitting: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            disabled={isSubmitting}
            className="w-full disabled:opacity-50 disabled:pointer-events-none"
        >
            <div
                className="transition-all ease-out duration-250 group min-w-32 w-full overflow-hidden border-[1px] border-transparent bg-white text-white active:brightness-[85%]"
                style={{
                    clipPath:
                        "polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 15px 100%, 0% calc(100% - 15px), 0% 100%, 0% 0%)",
                }}
            >
                <div
                    className="transition-all ease-out duration-250 w-full overflow-hidden bg-white hover:bg-[#010921] hover:text-white active:bg-white active:text-black group-active:brightness-[85%] text-[#010921]"
                    style={{
                        clipPath:
                            "polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 15px 100%, 0% calc(100% - 15px), 0% 100%, 0% 0%)",
                    }}
                >
                    <div className="transition-all ease-out duration-250 px-5 md:px-7 py-2 text-xs lg:text-base min-w-max text-center">
                        {isSubmitting ? "PROCESSING..." : "NEXT"}
                    </div>
                </div>
            </div>
        </button>
    );
};

export default ButtonV2New;
